import {
    PiHouseLineDuotone,
    PiWalletDuotone,
    PiCodeDuotone,
    PiGridFourDuotone,
    PiHeadsetDuotone,
    PiListDuotone,
    PiShoppingCartDuotone,
    PiSpinnerGapDuotone,
    PiStackDuotone,
    PiLockKeyOpenDuotone,
    PiUsersDuotone,
    PiGearDuotone,
    PiUserCircleDuotone,
} from 'react-icons/pi'
import {
    FaFacebook,
    FaTiktok,
    FaInstagram,
    FaYoutube,
    FaTelegram,
    FaThreads,
    FaXTwitter,
    FaDiscord,
} from 'react-icons/fa6'
import { SiShopee } from 'react-icons/si'
import type { JSX } from 'react'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    // Main menu icons
    dashboard: <PiHouseLineDuotone />,
    wallet: <PiWalletDuotone />,
    api: <PiCodeDuotone />,
    otherServices: <PiGridFourDuotone />,
    support: <PiHeadsetDuotone />,
    serviceList: <PiListDuotone />,
    orders: <PiShoppingCartDuotone />,
    luckyWheel: <PiSpinnerGapDuotone />,
    bulkOrder: <PiStackDuotone />,
    unlockFb: <PiLockKeyOpenDuotone />,
    users: <PiUsersDuotone />,
    settings: <PiGearDuotone />,
    user: <PiUserCircleDuotone />,

    // Platform icons
    facebook: <FaFacebook className="text-[#1877F2]" />,
    tiktok: <FaTiktok />,
    instagram: <FaInstagram className="text-[#E4405F]" />,
    youtube: <FaYoutube className="text-[#FF0000]" />,
    telegram: <FaTelegram className="text-[#0088CC]" />,
    threads: <FaThreads />,
    twitter: <FaXTwitter />,
    discord: <FaDiscord className="text-[#5865F2]" />,
    shopee: <SiShopee className="text-[#EE4D2D]" />,
}

export default navigationIcon
