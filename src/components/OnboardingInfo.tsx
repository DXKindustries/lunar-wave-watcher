import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Info, Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import UnifiedLocationInput from './UnifiedLocationInput';
import { LocationData } from '@/types/locationTypes';

type OnboardingInfoProps = {
  onGetStarted: (location?: LocationData) => void;
};

const OnboardingInfo = ({ onGetStarted }: OnboardingInfoProps) => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [nickname, setNickname] = useState('');

  const handleEnterLocationClick = () => {
    console.log('🔄 OnboardingInfo: Enter Your Location button clicked');
    setShowLocationModal(true);
  };

  const handleLocationSelect = (location: LocationData) => {
    console.log('🔄 OnboardingInfo: Location selected:', location);

    const withNickname = {
      ...location,
      nickname: nickname.trim() || undefined
    };

    // Close modal and trigger location change
    setShowLocationModal(false);
    onGetStarted(withNickname);
    setNickname('');
  };

  const handleModalClose = () => {
    setShowLocationModal(false);
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-start gap-2 text-xs bg-moon-primary/10 border border-moon-primary/20 py-3 px-3 rounded-lg">
          <Info className="h-3 w-3 text-moon-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="font-medium text-moon-primary">Welcome to MoonTide!</div>
            <div className="text-muted-foreground space-y-1">
              <div>• Enter ZIP code: <code>02840</code></div>
              <div>• City/State: <code>Newport RI</code></div>
              <div>• Full format: <code>Newport RI 02840</code></div>
              <div>• Station name: <code>Green Cove Springs</code></div>
              <div>• NOAA station ID: <code>8454000</code></div>
              <div>• Moon and solar data for all locations</div>
            </div>
          </div>
        </div>
        
        <Button
          onClick={handleEnterLocationClick}
          className="w-full bg-moon-primary hover:bg-moon-primary/90 text-white py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          Enter Your Location
        </Button>
      </div>

      <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Enter Your Location
              <Button
                variant="ghost"
                size="sm"
                onClick={handleModalClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Type a ZIP code, city and state, or NOAA station name/ID. Example: <code>02840</code>, <code>Newport RI</code>, <code>Green Cove Springs</code>, or <code>8454000</code>.
            </DialogDescription>
          </DialogHeader>
          
          <UnifiedLocationInput
            onLocationSelect={handleLocationSelect}
            onClose={handleModalClose}
            placeholder="02840 or Newport RI"
            autoFocus={true}
          />
          <div className="mt-4 space-y-2">
            <Label htmlFor="onboard-nickname">Custom Name (Optional)</Label>
            <Input
              id="onboard-nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g., Home"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OnboardingInfo;
