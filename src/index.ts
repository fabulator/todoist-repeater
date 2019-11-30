/* eslint-disable @typescript-eslint/camelcase */
import 'cross-fetch/polyfill';
import dotenv from 'dotenv';
import Queue from 'bull';
import uuidv1 from 'uuid/v1';
import TodoistSyncApi from './sync/TodoistSyncApi';

dotenv.config();

export type EventName = 'item:added' | 'item:completed';

export type HookBody = {
    event_name: EventName,
    initiator: {
        is_premium: boolean,
        image_id: string,
        id: number,
        full_name: string,
        email: string,
    },
    version: string,
    user_id: number,
    event_data: {
        legacy_project_id: number,
        is_deleted: number,
        assigned_by_uid: number,
        labels: number[],
        sync_id: null | number,
        section_id: null | number,
        in_history: number,
        child_order: number,
        date_added: string,
        checked: number,
        id: number,
        content: string,
        date_completed: null | string,
        user_id: number,
        url: string,
        due: null | {
            date: string,
            timezone: null,
            is_recurring: boolean,
            string: string,
            lang: 'en',
        },
        priority: number,
        parent_id: null | number,
        responsible_uid: null | number,
        project_id: number,
        collapsed: number,
    },
}

const queue = new Queue('todoist', process.env.REDIS);

const api = new TodoistSyncApi(process.env.ACCESS_TOKEN, process.env.COOKIE);

console.log('Starting');

queue.process(async (job: Queue.Job<HookBody>, done: any) => {
    console.log(job);
    const { data } = job;

    if (data.event_name !== 'item:completed' || !data.event_data.due) {
        done();
        return;
    }

    const response = await api.get(`archive/items?parent_id=${data.event_data.id}`);

    const subtasks = response.data.items;

    if (subtasks.length > 0) {
        await api.command(subtasks.map(({ id }: any) => {
            return {
                type: 'item_uncomplete',
                uuid: uuidv1(),
                args: { id },
            };
        }));
    }

    done();
});
