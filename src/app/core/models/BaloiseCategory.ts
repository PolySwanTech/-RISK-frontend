export interface BaloiseCategory {
  id : string;
  name: string;
  description: string;
  enfants : BaloiseCategory[];
}
