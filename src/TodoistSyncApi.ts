import { Api, DefaultApiException, DefaultResponseProcessor } from 'rest-api-handler';

type Resource = 'items' | 'projects';

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
}

type Project = {
    is_archived: number,
    color: number,
    shared: boolean,
    inbox_project: boolean,
    id: number,
    collapsed: number,
    child_order: number,
    name: string,
    is_deleted: number,
    parent_id: number | null,
}

type SyncResponse = {
    full_sync: boolean,
    temp_id_mapping: Object,
    sync_token: string,
    items: Task[],
    projects: Project[],
}

export default class TodoistApi extends Api {
    protected token: string;
    protected syncToken: string;

    constructor(token: string) {
        super('https://api.todoist.com/sync/v8/sync', [new DefaultResponseProcessor(DefaultApiException)], {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        });
        this.token = token;
        this.syncToken = '*';
    }

    async sync(resources: Resource[]): Promise<SyncResponse> {
        const { data } = await this.post('', {
            token: this.token,
            sync_token: this.syncToken,
            resource_types: resources,
        });
        this.syncToken = data.syncToken;
        return data;
    }

    async command(commands: any[]): Promise<void> {
        const { data } = await this.post('', {
            token: this.token,
            commands: commands,
        });
        return data;
    }
}
