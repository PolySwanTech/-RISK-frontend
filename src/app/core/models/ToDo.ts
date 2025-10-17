import { ToDoType } from "../enum/to-do.enum";

export interface ToDo {
    type : ToDoType;
    libelle : string;
    date : Date;
    id : string;
}