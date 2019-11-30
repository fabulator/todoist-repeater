export interface Due {
    date: string,
    timezone: null,
    is_recurring: boolean,
    string: string,
    lang: string,
}

export interface Task {
    day_order: number,
    assigned_by_uid: number,
    labels: number[],
    sync_id: number | null,
    section_id: number | null,
    in_history: number,
    child_order: number,
    date_added: string,
    id: number,
    content: string,
    checked: number,
    user_id: number,
    due: Due,
    priority: number,
    parent_id: null | number,
    is_deleted: number,
    responsible_uid: null | number,
    project_id: number,
    date_completed: null | string,
    collapsed: number,
}

export interface Project {
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

export type Resource = 'items' | 'projects';
