import { UserInput } from '../../types/user.interface';

export const userTestData: UserInput[] = [
  {
    username: 'dr_mensah',
    hashed_password: '$2b$10$klmnopqrstKLMNOPQRST34',
    email: 'mensah@preservationaux.com',
    name: 'Dr. Ayda Mensah',
    role: 'admin',
  },
  {
    username: 'gurathin',
    hashed_password: '$2b$10$efghijklmnEFGHIJKLMN78',
    email: 'gurathin@preservationaux.com',
    name: 'Gurathin',
    role: 'staff',
  },
  {
    username: 'murderbot',
    hashed_password: '$2b$10$abcdefghijABCDEFGHIJ12',
    email: 'secunit238776431@thecompany.com',
    name: 'Murderbot',
    role: 'user',
  },
];
