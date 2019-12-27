const express = require('express');
const router = express.Router();
const request = require('request');
const $ = require('cheerio');
const cheerioTableparser = require('cheerio-tableparser');

cheerioTableparser($);

const parseMTAResponse = function(code: string, data: any) {

    let response: {
        reg_code?: undefined | string | number,
        person_code?: undefined | string | number,
        company_name?: null | string,
        tax_debt_check_time?: undefined | string,
        tax_debt_missing?: undefined | boolean,
        tax_debt_start_date?: undefined | string,
        tax_debt_schedule_end_date?: undefined | string,        
        estimated_interest?: undefined | number,
        estimated_interest_scheduled?: undefined | number,
        total_tax_debt?: undefined | number| string,
        total_tax_debt_in_schedule?: undefined | number | string,
        total_tax_debt_in_dispute?: undefined | number | string,
        tax_debt_details?: undefined | any[],
        missing_declarations?: undefined | any[] 
    } = {};

    let rows = $('p', data);
    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        let line = row.children[0].data;

        if(line !== undefined) {
            let tmp = null;

            // find company name from response
            if(code.length === 8) {
                let companyNameRegex = /on isikul\s(?<company_name1>.*)\S(?<reg_code1>(\w{8}))|Isikul\s(?<company_name2>.*)\S(?<reg_code2>(\w{8}))/;
                tmp = null;
                if ((tmp = companyNameRegex.exec(line)) !== null) {
                    if(tmp.groups !== undefined) {
                        response.reg_code = (tmp["groups"].reg_code1 !== undefined && tmp["groups"].reg_code1 !== null) ? tmp["groups"].reg_code1 : tmp["groups"].reg_code2;
                        response.company_name = (tmp["groups"].company_name1 !== undefined && tmp["groups"].company_name1 !== null) ? tmp["groups"].company_name1.trim() : tmp["groups"].company_name2.trim();
                    }
                }
            }
            
            if(code.length === 11) {
                let personNameRegex = /on isikul\s(?<reg_code1>(\w{11}))|Isikul\s(?<reg_code2>(\w{11}))/;
                tmp = null;
                if ((tmp = personNameRegex.exec(line)) !== null) {
                    if(tmp.groups !== undefined) {
                        response.person_code = (tmp["groups"].reg_code1 !== undefined && tmp["groups"].reg_code1 !== null) ? tmp["groups"].reg_code1 : tmp["groups"].reg_code2;
                    }
                }
            } 

            let checkTimeRegex = /seisuga (?<tax_debt_check_time>\d{2}.\d{2}.\d{4} \d{2}:\d{2}:\d{2})/;
            tmp = null;
            if ((tmp = checkTimeRegex.exec(line)) !== null) {
                if(tmp.groups !== undefined) {
                    let dateTime = tmp["groups"].tax_debt_check_time.split(" ");
                    let date = dateTime[0].split('.');                    
                    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit',second:'2-digit' };
                    response.tax_debt_check_time  = new Date(date[2]+"-"+date[1]+"-"+date[0]+" "+dateTime[1]).toLocaleDateString("et-EE", options);
                }
            }

            // check if the company doesn't have tax debts
            if(line.match(/\d{2}.\d{2}.\d{4} \d{2}:\d{2}:\d{2} võlg puudub/)) {
                response.tax_debt_missing = true;
            }     
            
            // find taxt debt start date
            let startDateRegex = /Võla alguskuupäev: (?<tax_debt_start_date>\d{2}.\d{2}.\d{4})/;
            tmp = null;
            if ((tmp = startDateRegex.exec(line)) !== null) {
                if(tmp.groups !== undefined) {
                    let date = tmp["groups"].tax_debt_start_date.split('.');
                    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
                    response.tax_debt_start_date  = new Date(date[2]+"-"+date[1]+"-"+date[0]).toLocaleDateString("et-EE", options);
                }
            }

            let scheduleEndDateRegex = /Tasumisgraafikus oleva võla tasumise lõppkuupäev: (?<tax_debt_schedule_end_date>\d{2}.\d{2}.\d{4})/;
            tmp = null;
            if ((tmp = scheduleEndDateRegex.exec(line)) !== null) {
                if(tmp.groups !== undefined) {
                    let date = tmp["groups"].tax_debt_schedule_end_date.split('.');
                    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
                    response.tax_debt_schedule_end_date  = new Date(date[2]+"-"+date[1]+"-"+date[0]).toLocaleDateString("et-EE", options);
                }
            }

            let intresRegex = /intress.(?<tax_debt_intres>\d*,\d{2})/;
            tmp = null;
            if ((tmp = scheduleEndDateRegex.exec(line)) !== null) {
                if(tmp.groups !== undefined) {
                    response.estimated_interest = parseFloat(tmp["groups"].tax_debt_intres);
                }
            }

            let scheduledRegex = /tasumisgraafikus.(?<tax_debt_scheduled>\d*,\d{2})/;
            tmp = null;
            if ((tmp = scheduleEndDateRegex.exec(line)) !== null) {
                if(tmp.groups !== undefined) {
                    response.estimated_interest_scheduled = parseFloat(tmp["groups"].tax_debt_scheduled);
                }
            }

                       
        }
    }

    let fields = ['debt_type', 'amount', 'in_schedule', 'in_dispute'];
    let details: { [x: string]: any; }[] = [];
    let missing_declarations: { [x: string]: any; }[] = [];
    let tables = $('table', data);
    let i = 0;
    for (let tblID = 0; tblID < tables.length; tblID++) {
        let table = tables[tblID];
        let parsedTable = $(table).parsetable(true, true, true);
        
        for (let r = 0; r < parsedTable.length; r++) {
            let row = parsedTable[r];
            
            for (let j = 0; j < row.length; j++) {  
                let td = row[j];
                if(tblID === 0) {
                    let fieldName = fields[r];                                        
                    if(details[j] === undefined) {      details[j] = []; }
                    if(details[j][r] === undefined) {   details[j][r] = []; }
                    details[j][r][fieldName] = td;
                }   

                if(tblID === 1 && j > 0) {  
                    let index = j - 1;
                    if(missing_declarations[index] === undefined) {      missing_declarations[index] = []; }
                    if(missing_declarations[index][r] === undefined) {   missing_declarations[index][r] = []; }
                    missing_declarations[index][r] = td;
                }
            }
            
        }

        i++;
    }

    const fixNumber = function(str: string) {
        return parseFloat(str.replace(/\s/g, '').replace(/,/g, '.'));
    };

    let _total_tax_debt = 0;
    let _total_tax_debt_in_schedule = 0;
    let _total_tax_debt_in_dispute = 0;

    let debt_details: any[] = [];
    if(details.length > 0) {
        for (let index = 0; index < details.length - 1; index++) {
            if(index > 0) {
                _total_tax_debt += fixNumber(details[index][1].amount);
                _total_tax_debt_in_schedule += fixNumber(details[index][2].in_schedule);
                _total_tax_debt_in_dispute += fixNumber(details[index][3].in_dispute);

                debt_details.push({ 
                    debt_type: details[index][0].debt_type, 
                    amount: fixNumber(details[index][1].amount).toFixed(2),
                    in_schedule: fixNumber(details[index][2].in_schedule).toFixed(2), 
                    in_dispute: fixNumber(details[index][3].in_dispute).toFixed(2)
                });
            }            
        }
    }

    let missing_declars: any[] = [];
    if(missing_declarations.length > 0) {
        for (let index = 0; index < missing_declarations.length; index++) {
            let date = missing_declarations[index][1].split('.');
            const options = { year: 'numeric', month: '2-digit', day: '2-digit' };

            missing_declars.push({ 
                declaration_type: missing_declarations[index][0], 
                declaration_date: new Date(date[2]+"-"+date[1]+"-"+date[0]).toLocaleDateString("et-EE", options),
            });           
        }
    }

    response.missing_declarations = (missing_declars.length > 0) ? missing_declars : undefined;

    response.tax_debt_details = (debt_details.length > 0) ? debt_details : undefined;

    if(_total_tax_debt > 0) {               response.total_tax_debt = _total_tax_debt.toFixed(2); }
    if(_total_tax_debt_in_schedule > 0) {   response.total_tax_debt_in_schedule = _total_tax_debt_in_schedule.toFixed(2); }
    if(_total_tax_debt_in_dispute > 0) {    response.total_tax_debt_in_dispute = _total_tax_debt_in_dispute.toFixed(2); }

    return response;
};

router.get('/:regCode', (req: any, res: any) => {
    let mtaFormUri:string = process.env.MTA_FORM_URL || '';
    let mtaTaxDebtUri:string = process.env.MTA_TAX_DEBT_URL || '';

    let taxResponse: any = null;

    let req2 = request.defaults({
        jar: true,                 // save cookies to jar
        rejectUnauthorized: false, 
        followAllRedirects: true   // allow redirections
    });

    req2.get({ url: mtaFormUri}, function(_err: any, _resp: any, _body: any) {
        let csrfTokenValue = $('input[name="CSRFToken"]', _body);
        if(csrfTokenValue.length > 0) {
            csrfTokenValue = csrfTokenValue[0].attribs.value;
        }

        req2.post({
            url: mtaTaxDebtUri,
            form: {personCode: req.params.regCode, p_submit: "Otsi", CSRFToken: csrfTokenValue},
            jar: "true",
            followAllRedirects: true
        }, function(_error: any, _response: any, _body: any) {
            taxResponse = parseMTAResponse(req.params.regCode, _body);
            res.json(taxResponse);
        });
    });
});

module.exports = router;