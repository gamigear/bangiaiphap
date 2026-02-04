'use client'

import { Card } from '@/components/ui'
import type { Announcement } from '@/@types/smm'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'

dayjs.extend(relativeTime)
dayjs.locale('vi')

interface AnnouncementCardProps {
    announcement: Announcement
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
    return (
        <Card className="p-4 mb-3 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-subtle flex items-center justify-center text-primary font-bold flex-shrink-0">
                    {announcement.author.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold heading-text truncate">
                            {announcement.title}
                        </h4>
                        <div className="flex gap-1 flex-shrink-0 ml-2">
                            {announcement.isPinned && (
                                <span className="px-2 py-0.5 bg-error text-white text-xs rounded">
                                    📌
                                </span>
                            )}
                            <span className="px-2 py-0.5 bg-success text-white text-xs rounded">
                                ✓
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                        {dayjs(announcement.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    </p>
                    <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                        {announcement.content}
                    </div>
                </div>
            </div>
        </Card>
    )
}

interface AnnouncementListProps {
    announcements: Announcement[]
}

export default function AnnouncementList({ announcements }: AnnouncementListProps) {
    return (
        <div>
            {announcements.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
        </div>
    )
}
