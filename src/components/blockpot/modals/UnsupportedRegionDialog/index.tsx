import { useCountry } from '@/providers/CountryProvider'
import { Button, Dialog, DialogContent, DialogTopSection, SocialButton } from '@blockpot-dev/blockpot-design-system'
import { ElevatedIcon } from '@blockpot-dev/blockpot-design-system'
import { SOCIAL_MEDIA } from '@/constants/social-media'

export type _UnsupportedRegionDialogProps = {
    countryName: string
    onReload: () => void
}

export function _UnsupportedRegionDialog(props: _UnsupportedRegionDialogProps) {
    const { countryName, onReload } = props
    return (
        <Dialog open={true} onOpenChange={() => { }}>
            <DialogContent showCloseButton={false}>
                <DialogTopSection
                    icon={<ElevatedIcon src='/assets/pngs/map-badge.png' alt='' />}
                    title="Blockpot isn't offered in your region"
                />
                <p className='text-base text-secondary-foreground min-w-[450px] mx-4 text-center'>
                    {`Blockpot isn't offered in ${countryName}. If you're on a VPN, turn it off and reload the page.`}
                </p>
                <div className='flex justify-center pt-6'>
                    <Button onClick={onReload} className='uppercase font-bold'>Reload page</Button>
                </div>
                <p className='text-sm text-secondary-foreground text-center pt-8'>Follow us for updates on new regions</p>
                <div className="flex gap-4 pt-3 pb-4 justify-center">
                    {
                        SOCIAL_MEDIA.map((social) => (
                            <a href={social.url} target="_blank" rel="noopener noreferrer" key={social.name} aria-label={social.name}>
                                <SocialButton>
                                    <img src={social.src} alt='' width={20} height={20} />
                                </SocialButton>
                            </a>
                        ))
                    }
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default function UnsupportedRegionDialog() {
    const { country, countryName } = useCountry()

    // if a country exists and it is not US, show the dialog
    if (!country || country === 'US') {
        return null
    }

    return <_UnsupportedRegionDialog countryName={countryName ?? 'your region'} onReload={() => window.location.reload()} />
}
