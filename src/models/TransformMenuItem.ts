import { TransformCallback } from "./TransformCallback";

export interface TransformMenuItem {
    title: string
    icon: string
    transformFn: TransformCallback
}
