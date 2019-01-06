import { VirtualNode } from '../Renderer/VirtualElement/VirtualNode'

export interface ParsedDataAttribGroup {
    [key: string]: string
}

export interface ParsedDataAttribs {
    dynamic?: ParsedDataAttribGroup
    technical?: ParsedDataAttribGroup
    dynamicTechnical?: ParsedDataAttribGroup
    static?: ParsedDataAttribGroup
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
