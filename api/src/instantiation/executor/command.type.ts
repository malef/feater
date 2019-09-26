import {SimpleCommand} from './simple-command';
import {ContextAwareCommand} from './context-aware-command';
import {CommandsList} from './commands-list';
import {CommandsMap} from './commands-map';

export type CommandType = (
    SimpleCommand |
    ContextAwareCommand |
    CommandsList |
    CommandsMap
);
