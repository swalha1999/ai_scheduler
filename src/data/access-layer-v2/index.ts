import {
    UsersService,
    FilesService,
} from './services';

const dal = {
    users: new UsersService(),
    files: new FilesService(),
};


export default dal;