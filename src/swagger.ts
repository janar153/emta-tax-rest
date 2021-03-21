export const swaggerDocument = {
    openapi: '3.0.2',
    info: {
        version: '1.0.1',
        title: 'EMTA Tax controller RestAPI',
        description: 'RestAPI to check companies tax debts from EMTA (www.emta.ee)',
        termsOfService: '',
        contact: {
            name: 'Janar Nagel',
            email: 'janar153@gmail.com'
        },
        license: {
            name: 'Apache 2.0',
            url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
        }
    },
    paths: {
        "/tax/{regCode}": {
            "get": {
                description: "Get company tax debt details",
                operationId: "getTax",
                tags: ["Tax"],
                parameters: [
                    {
                        in: "path",
                        name: "regCode",
                        schema: {
                            type: "integer"
                        },
                        required: true
                    }
                ],
                responses: {
                    "200": {
                        description: "Tax debt response",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        reg_code: {
                                            type: "integer",
                                            description: "Registration number"
                                        },
                                        person_code: {
                                            type: "string",
                                        },
                                        company_name: {
                                            type: "string",
                                        },
                                        tax_debt_check_time: {
                                            type: "string"
                                        },
                                        tax_debt_missing: {
                                            type: "boolean"
                                        },
                                        tax_debt_start_date: {
                                            type: "string"
                                        },
                                        tax_debt_schedule_end_date: {
                                            type: "string"
                                        },
                                        estimated_interest: {
                                            type: "number"
                                        },
                                        estimated_interest_scheduled: {
                                            type: "number"
                                        },
                                        total_tax_debt: {
                                            type: "number"
                                        },
                                        total_tax_debt_in_schedule: {
                                            type: "number"
                                        },
                                        total_tax_debt_in_dispute: {
                                            type: "number"
                                        },
                                        tax_debt_details: {
                                            type: "array",
                                            items: {
                                                properties: {
                                                    debt_type: {
                                                        type: "string"
                                                    },
                                                    amount: {
                                                        type: "number"
                                                    },
                                                    in_schedule: {
                                                        type: "number"
                                                    },
                                                    in_dispute: {
                                                        type: "number"
                                                    }
                                                }
                                            }
                                        },
                                        missing_declarations: {
                                            type: "array",
                                            items: {
                                                properties: {
                                                    declaration_type: {
                                                        type: "string"
                                                    },
                                                    declaration_date: {
                                                        type: "string"
                                                    }
                                                }
                                            }
                                        }                                        
                                    } 
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
