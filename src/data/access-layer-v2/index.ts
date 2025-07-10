import {
    UsersService,
    FilesService,
    ContactsService,
} from './services';

const dal = {
    users: new UsersService(),
    files: new FilesService(),
    contacts: new ContactsService(),
};


export default dal;