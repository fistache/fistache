import { VirtualObject } from '../Renderer/VirtualElement/VirtualObject'

export interface ParsedDataAttribs {
    [key: string]: string
}

export interface ParsedData {
    type: ParsedDataType
    position: number
    virtualObject: VirtualObject
    name: string
    data: string
    attribs: ParsedDataAttribs
    children?: ParsedData[]
}

export enum ParsedDataType {
    Tag = 'tag',
    Text = 'text',
    Comment = 'comment',
}
