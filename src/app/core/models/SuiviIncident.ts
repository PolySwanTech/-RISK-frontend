export class SuiviIncident{
    id : number
    content : string
    date : Date
    writter : string

    constructor(
        id : number,
        content : string,
        date : Date,
        writter : string    
    ){
        this.id = id
        this.content = content
        this.date = date
        this.writter = "writter"
    }
}