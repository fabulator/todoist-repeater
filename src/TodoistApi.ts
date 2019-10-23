import { Api, DefaultApiException, DefaultResponseProcessor } from 'rest-api-handler';

type Task = {
    id: number,
    project_id: number,
    order: number,
    content: string,
    completed: boolean,
    label_ids: any[],
    priority: number,
    comment_count: number,
    created: string,
    url: string,
    date_completed: string | null,
}

export default class TodoistApi extends Api {
    constructor(token: string) {
        super('https://api.todoist.com/rest/v1', [new DefaultResponseProcessor(DefaultApiException)], {
            Authorization: `Bearer ${token}`
        });
    }

    async getTasks(filter: Object): Promise<Task[]> {
        const { data } = await this.get('tasks', filter);
        return data;
    }

    async reopenTask(id: number): Promise<void> {
        await this.post(`tasks/${id}/reopen`);
    }
}
