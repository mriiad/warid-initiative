import { Person } from "../models/person";

const isDonor = (person: Person): boolean => person.disease != undefined;