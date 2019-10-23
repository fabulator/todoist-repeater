import 'cross-fetch/polyfill';
import dotenv from 'dotenv';
import uuidv1 from 'uuid/v1';
import TodoistSyncApi from './TodoistSyncApi';

dotenv.config();

const api = new TodoistSyncApi(process.env.ACCESS_TOKEN);

(async () => {
    const { items } = await api.sync(['items']);
    const u = items
        // @ts-ignore
        .filter(({ date_completed }) => date_completed !== null);

    await api.command(u.map(({ id }) => {
        return {
            type: 'item_uncomplete',
            uuid: uuidv1(),
            args: { id },
        };
    }))
})();
