'use client'

import { Card } from '@/components/ui'
import {
    PiTiktokLogoDuotone,
    PiBellRingingDuotone,
    PiTagDuotone,
} from 'react-icons/pi'
import classNames from 'classnames'

interface Update {
    id: string
    type: 'service' | 'server' | 'promotion'
    title: string
    content: string
    timeAgo: string
}

interface UpdateItemProps {
    update: Update
}

function UpdateItem({ update }: UpdateItemProps) {
    const getIcon = () => {
        switch (update.type) {
            case 'service':
                return <PiTiktokLogoDuotone className="text-lg" />
            case 'server':
                return <PiBellRingingDuotone className="text-lg" />
            case 'promotion':
                return <PiTagDuotone className="text-lg" />
            default:
                return <PiBellRingingDuotone className="text-lg" />
        }
    }

    const getIconBg = () => {
        switch (update.type) {
            case 'service':
                return 'bg-primary-subtle text-primary'
            case 'server':
                return 'bg-info-subtle text-info'
            case 'promotion':
                return 'bg-success-subtle text-success'
            default:
                return 'bg-gray-100 text-gray-500'
        }
    }

    return (
        <div className="flex gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
            <div className={classNames(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                getIconBg()
            )}>
                {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h5 className="font-medium heading-text text-sm truncate">
                        {update.title}
                    </h5>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {update.timeAgo}
                    </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {update.content}
                </p>
            </div>
        </div>
    )
}

interface RecentUpdatesProps {
    updates: Update[]
}

export default function RecentUpdates({ updates }: RecentUpdatesProps) {
    return (
        <Card className="p-4">
            <h4 className="font-semibold heading-text mb-3">Cập nhật mới nhất</h4>
            <div>
                {updates.map((update) => (
                    <UpdateItem key={update.id} update={update} />
                ))}
            </div>
        </Card>
    )
}
