'use client'

import React, { useState, useCallback, useEffect } from 'react'

import Link from 'next/link'

import {
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  Chip,
  LinearProgress,
  Typography,
  Box
} from '@mui/material'
import { Plus, ArrowLeft } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'

import AvatarSelector from '@/components/effects/AvatarSelector'
import ConnectWalletButton from '@/components/wallet/ConnectWalletButton'

const interests = [
  'Fiction books',
  'Non-fiction books',
  'Classic literature',
  'Poetry collections',
  'Fantasy novels',
  'Mystery and thrillers',
  'Science fiction',
  'Historical fiction',
  'Biography and memoirs',
  'Self-help books',
  "Children's literature",
  'Young adult novels',
  'Graphic novels',
  'Book clubs',
  'Rare and antique books',
  'Book fairs and festivals',
  'Library science and organization',
  'E-books and digital libraries',
  'Audiobooks',
  'Bestsellers and new releases',
  'Writing and publishing',
  'Libraries as community spaces',
  'Literary criticism and analysis',
  'Bookbinding and preservation',
  'Independent bookstores'
]

const ProfileStep = React.memo(
  ({
    profileImage,
    wallet,
    name,
    email,
    bio,
    socialMedia,
    setName,
    setEmail,
    setBio,
    setAvatar,
    handleSocialMediaChange
  }: {
    profileImage: string
    wallet: string
    name: string
    email: string
    bio: string
    socialMedia: any[]
    setName: (value: string) => void
    setEmail: (value: string) => void
    setBio: (value: string) => void
    setAvatar: (value: string) => void
    handleSocialMediaChange: (index: number, field: string, value: string) => void
  }) => (
    <>
      <div className='flex justify-center mb-6'>
      <AvatarSelector
  onAvatarChange={setAvatar}
  uniqueId={wallet}
  initialImage={profileImage} // Pass the current avatar as initialImage
/>
      </div>

      <div className='space-y-6'>
        <div>
          <TextField
            fullWidth
            label='Name (Required)'
            variant='outlined'
            placeholder='Type your name...'
            size='small'
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div>
          <TextField
            fullWidth
            label='Email (Optional)'
            variant='outlined'
            placeholder='Type your name...'
            size='small'
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div>
          <TextField
            fullWidth
            label='Bio'
            variant='outlined'
            placeholder='Say something about yourself...'
            multiline
            rows={4}
            size='small'
            value={bio}
            onChange={e => setBio(e.target.value)}
          />
        </div>

        <div>
          <InputLabel className='mb-2 text-sm'>Where else can you be found? (optional)</InputLabel>
          {/* Social Media Fields */}
          {socialMedia.map((media, index) => (
            <div key={index} className='flex gap-2 mt-4'>
              <FormControl size='small' className='w-[140px]'>
                <Select
                  value={media.platform}
                  onChange={e => handleSocialMediaChange(index, 'platform', e.target.value as string)}
                >
                  <MenuItem value='instagram'>Instagram</MenuItem>
                  <MenuItem value='twitter'>Twitter</MenuItem>
                  <MenuItem value='linkedin'>LinkedIn</MenuItem>
                  <MenuItem value='facebook'>Facebook</MenuItem>
                  <MenuItem value='tiktok'>TikTok</MenuItem>
                </Select>
              </FormControl>
              <TextField
                placeholder='@yourhandle'
                size='small'
                fullWidth
                value={media.handle}
                onChange={e => handleSocialMediaChange(index, 'handle', e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )
)

const InterestsStep = React.memo(
  ({
    selectedInterests,
    showAllInterests,
    handleInterestToggle,
    handleShowAllInterests
  }: {
    selectedInterests: string[]
    showAllInterests: boolean
    handleInterestToggle: (interest: string) => void
    handleShowAllInterests: () => void
  }) => {
    const displayedInterests = showAllInterests ? interests : interests.slice(0, 20)

    return (
      <>
        <Typography variant='body2' className='text-center mb-6'>
          We will recommend great books and curators based on the interests you select
        </Typography>
        <div className='flex flex-wrap gap-2 mb-6'>
          {displayedInterests.map(interest => (
            <Chip
              key={interest}
              label={interest}
              onClick={() => handleInterestToggle(interest)}
              color={selectedInterests.includes(interest) ? 'primary' : 'default'}
              sx={{
                borderRadius: '16px',
                backgroundColor: selectedInterests.includes(interest) ? '#AE5B05' : '#ffffff',
                color: '#2B1810',
                border: '1px solid #AE5B05',
                '&:hover': {
                  backgroundColor: '#AE5B05'
                }
              }}
            />
          ))}
          {!showAllInterests && interests.length > 20 && (
            <Chip icon={<Plus size={16} />} label='' variant='outlined' onClick={handleShowAllInterests} />
          )}
        </div>
      </>
    )
  }
)

const SuccessStep = () => (
  <>
    <Typography variant='body1' className='text-center mb-6'>
      All set! Head over to{' '}
      <Link href='/creator/home' className='hover:underline'>
        your dashboard.
      </Link>{' '}
      Borrow books, manage collections, and start building a literary haven.
    </Typography>
  </>
)

const UserOnboarding = () => {
  const [step, setStep] = useState(1)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [showAllInterests, setShowAllInterests] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [wallet, setWalletAddress] = useState('')
  const [profileImage, setAvatar] = useState('');
  const { user } = usePrivy()

  const [socialMedia, setSocialMedia] = useState([
    { platform: 'instagram', handle: '' },
    { platform: 'twitter', handle: '' },
    { platform: 'linkedin', handle: '' }
  ])

  const handleInterestToggle = useCallback((interest: string) => {
    setSelectedInterests(prev => (prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]))
  }, [])

  const handleShowAllInterests = useCallback(() => {
    setShowAllInterests(true)
  }, [])

  const handleBackToHome = () => {
    window.location.href = '/'
  }

  useEffect(() => {
    const fetchWalletAddress = async () => {
      try {
        setError('')

        if (user?.wallet) {
          setWalletAddress(user.wallet.address)
        }
      } catch (err) {
        setError((err as Error).message || 'Failed to fetch wallet address')
      }
    }

    fetchWalletAddress()
  }, [user])

  const handleLetsDoThis = () => {
    if (wallet) {
      window.location.href = `/user/dashboard/${wallet}`
    } else {
      setError('Wallet address not found. Please connect your wallet.')
    }
  }

  const handleContinue = async () => {
    if (step === 1) {
      if (!name.trim()) {
        setError('Name is required')

        return
      }

      setError('')
      setStep(2)
    } else if (step === 2) {
      setLoading(true)
      setError('')

      try {
        const onboardingData = {
          wallet,
          profileImage,
          email,
          name,
          bio,
          socialMedia,
          interests: selectedInterests
        }

        console.log('Onboarding Data', onboardingData)

        const response = await fetch('/api/user/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(onboardingData)
        })

        if (response.ok) {
          setStep(3)
        } else {
          const errorData = await response.json()

          setError(errorData.message || 'Failed to save onboarding data')
        }
      } catch (error) {
        setError('An error occurred while submitting. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSocialMediaChange = useCallback((index: number, field: string, value: string) => {
    setSocialMedia(prev => {
      const updated = [...prev]

      updated[index] = { ...updated[index], [field]: value }

      return updated
    })
  }, [])

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='w-full max-w-4xl p-4'>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
        >
          <LinearProgress
            variant='determinate'
            value={step === 1 ? 25 : step === 2 ? 50 : 100}
            sx={{
              height: 4,
              backgroundColor: '#2B1810',
              '.MuiLinearProgress-bar': {
                backgroundColor: '#F8F2EB'
              }
            }}
          />
          <Button
            sx={{
              position: 'absolute',
              top: 8,
              left: 8, // Move to the far right
              zIndex: 1200,
              color: '#000000',
            }}
            onClick={handleBackToHome}
            startIcon={<ArrowLeft className="w-6 h-6" />} // Add the icon
          >
            Back
          </Button>
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1200,
            }}
          >
            <ConnectWalletButton />
          </Box>
        </Box>

        <div className='min-h-screen flex items-center justify-center'>
          <div className='w-full max-w-md mt-16'>
            <h1 className='text-3xl font-semibold text-center mb-8'>
              {step === 1 ? 'Set up your profile' : step === 2 ? 'Dive into your interests' : 'Success!'}
            </h1>
            <Card sx={{ backgroundColor: '#ffffff', border: '1px solid #2B1810' }}>
              <CardContent>
                {step === 1 ? (
                  <ProfileStep
                    profileImage={profileImage}
                    wallet={wallet}
                    name={name}
                    email={email}
                    bio={bio}
                    socialMedia={socialMedia}
                    setName={setName}
                    setEmail={setEmail}
                    setBio={setBio}
                    setAvatar={setAvatar}
                    handleSocialMediaChange={handleSocialMediaChange}
                  />
                ) : step === 2 ? (
                  <InterestsStep
                    selectedInterests={selectedInterests}
                    showAllInterests={showAllInterests}
                    handleInterestToggle={handleInterestToggle}
                    handleShowAllInterests={handleShowAllInterests}
                  />
                ) : (
                  <SuccessStep />
                )}

                <div className='mt-6 space-y-2'>
                  {error && (
                    <Typography color='error' className='text-center'>
                      {error}
                    </Typography>
                  )}

                  {step === 3 ? (
                    <Button
                      variant='contained'
                      fullWidth
                      onClick={handleLetsDoThis}
                      sx={{
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        '&:hover': { backgroundColor: '#ffffff' }
                      }}
                    >
                      Let&apos;s do this
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant='contained'
                        fullWidth
                        onClick={handleContinue}
                        disabled={loading}
                        sx={{
                          backgroundColor: '#2B1810',
                          color: '#F8F2EB',
                          '&:hover': { backgroundColor: '#5D4037' }
                        }}
                      >
                        {loading ? 'Submitting...' : 'Continue'}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserOnboarding
