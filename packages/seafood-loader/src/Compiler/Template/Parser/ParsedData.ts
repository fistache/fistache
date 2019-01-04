import { VirtualNode } from '../Renderer/VirtualElement/VirtualNode'

export interface ParsedDataAttribs {
    [key: string]: string
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
