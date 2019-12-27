# Simple EMTA tax debt check node app
To get check Estonia companies tax debt from EMTA and get results in JSON

## Install & using

### Step 1
Clone this project

### Step 2
```sh
$ cd path-to-your-project-location
$ npm install
$ npm start
```

### Step 3
* open browser http://localhost:3000/tax/:regCode
* replace :regCode with interested company registration code

## Example outputs

### Example request
```sh
open browser: http://localhost:3000/tax/11111111
```

### Example if company does not have tax debts
```json
{
    "reg_code":"11111111",
    "company_name":"Firma Nimi OÜ",
    "tax_debt_check_time":"2019-12-27 10:57:09",
    "tax_debt_missing":true    
}
```

### Example if company has tax debts
```json
{
    "reg_code":"11111111",
    "company_name":"Firma Nimi OÜ",
    "tax_debt_check_time":"2019-12-27 14:36:07","tax_debt_start_date":"2013-06-17",
    "tax_debt_details":[
        {
            "debt_type":"Intress",
            "amount":"1600.00",
            "in_schedule":"500.00",
            "in_dispute":"100.00"
        }
    ],
    "total_tax_debt":"1600.00",
    "total_tax_debt_in_schedule":"500.00",
    "total_tax_debt_in_dispute":"100.00"
}
```

### Example if company has tax debts and missing declarations
```json
{
    "reg_code":"11111111",
    "company_name":"Firma Nimi OÜ",
    "tax_debt_check_time":"2019-12-27 14:36:07","tax_debt_start_date":"2013-06-17",
    "missing_declarations":[
        {
            "declaration_type":"Käibedeklaratsioon","declaration_date":"2019-12-20"
        }
    ],
    "tax_debt_details":[
        {
            "debt_type":"Intress",
            "amount":"1600.00",
            "in_schedule":"500.00",
            "in_dispute":"100.00"
        }
    ],
    "total_tax_debt":"1600.00",
    "total_tax_debt_in_schedule":"500.00",
    "total_tax_debt_in_dispute":"100.00"
}
```