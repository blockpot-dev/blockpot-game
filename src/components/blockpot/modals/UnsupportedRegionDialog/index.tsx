import { useCountry } from '@/providers/CountryProvider'
import { Dialog, DialogContent, DialogTopSection, SocialButton } from '@blockpot-dev/block-pot-design-system'
import { ElevatedIcon } from '@blockpot-dev/block-pot-design-system'
import { SOCIAL_MEDIA } from '@/constants/social-media'

export default function UnsupportedRegionDialog() {
    const { country, countryName } = useCountry()

    // if a country exists and it is not US, show the dialog
    if (!country || country === 'US') {
        return null
    }

    return (
        <Dialog open={true} onOpenChange={() => { }}>
            <DialogContent showCloseButton={false}>
                <DialogTopSection
                    icon={<ElevatedIcon src='/assets/pngs/map-badge.png' alt='' />}
                    title='Blockpot is not available in your region'
                />
                <p className='text-base text-secondary-foreground min-w-[450px] mx-4 text-center'>{`Due to licensing restrictions, we are unable to accept players from ${countryName}. If you are using a VPN, please turn it off and try again.`}</p>
                <div className="flex gap-4 pt-8 pb-4 justify-center">
                    {
                        SOCIAL_MEDIA.map((social) => (
                            <a href={social.url} target="_blank" rel="noopener noreferrer" key={social.name}>
                                <SocialButton>
                                    <img src={social.src} alt={social.name} width={20} height={20} />
                                </SocialButton>
                            </a>
                        ))
                    }
                </div>
            </DialogContent>
        </Dialog>
    )

}