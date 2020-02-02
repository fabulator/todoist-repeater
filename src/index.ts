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

const rutineId = 2151244383;
const templateId = 2154002014;

queue.process(async (job: Queue.Job<HookBody>, done: any) => {
    console.log(job);
    const { data } = job;

    if (data.event_name !== 'item:completed' || !data.event_data.labels.includes(rutineId)) {
        done();
        return;
    }

    const { items } = await api.sync(['items']);

    const childTask = items.filter((item) => item.parent_id === data.event_data.id);

    const template = items.find((item) => item.content === data.event_data.content && item.labels.includes(templateId));

    if (!template) {
        console.log(`Error, cannot find the template ${data.event_data.content}.`);
        return;
    }

    const newTasks = items
        .filter((item) => item.parent_id === template.id)
        .map((item) => {
            return {
                ...item,
                parent_id: data.event_data.id,
            };
        });

    await api.command([
        ...childTask.map(({ id }) => {
            return {
                type: 'item_delete',
                uuid: uuidv1(),
                args: { id },
            };
        }),
        ...newTasks.map((task) => {
            return {
                type: 'item_add',
                uuid: uuidv1(),
                temp_id: uuidv1(),
                args: task,
            };
        }),
    ]);

    done();
});
