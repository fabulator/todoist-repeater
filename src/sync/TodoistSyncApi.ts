import { Api, DefaultApiException, DefaultResponseProcessor } from 'rest-api-handler';
import { Project, Task, Resource } from './types';

type SyncResponseBase = {
    full_sync: boolean,
    temp_id_mapping: Object,
    sync_token: string,
}

type SyncResponseResources = {
    items: Task[],
    projects: Project[],
}

export default class SyncApi extends Api {
    protected token: string;

    protected syncToken: string;

    constructor(token: string, cookie: string) {
        super('https://api.todoist.com/sync/v8', [new DefaultResponseProcessor(DefaultApiException)], {
            'Content-Type': 'application/json',
            cookie,
        });
        this.token = token;
        this.syncToken = '*';
    }

    async sync<R extends Resource>(resources: R[]): Promise<SyncResponseBase & Pick<SyncResponseResources, R>> {
        const { data } = await this.post('', {
            token: this.token,
            sync_token: this.syncToken,
            resource_types: resources,
        });
        this.syncToken = data.syncToken;
        return data;
    }

    async command(commands: any[]): Promise<void> {
        const { data } = await this.post('sync', {
            token: this.token,
            commands,
        }, Api.FORMATS.JSON, {
            Authorization: `Bearer ${this.token}`,
        });
        return data;
    }
}
