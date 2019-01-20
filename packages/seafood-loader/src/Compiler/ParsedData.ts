import { VirtualNode } from './Template/Renderer/VirtualElement/VirtualNode'

export interface ParsedDataAttrib {
    name: string
    value: string
}

export interface ParsedDataAttribs {
    dynamic?: ParsedDataAttrib[]
    technical?: ParsedDataAttrib[]
    technicalDynamic?: ParsedDataAttrib[]
    static?: ParsedDataAttrib[]
    bind?: string
}

export interface ParsedData {
    type: ParsedDataType
    position: number
    virtualNode?: VirtualNode | null
    name: string
    data: string
    attribs: ParsedDataAttribs
    children?: ParsedData[]
}

export enum ParsedDataType {
    Tag = 'tag',
    Text = 'text',
    Comment = 'comment'
}
