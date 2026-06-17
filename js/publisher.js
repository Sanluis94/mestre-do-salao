// ==========================================
// publisher.js — Publisher SDK & Monetization Bridge
// Supports Poki, CrazyGames, Telegram WebApp (TON) and local simulation fallbacks
// ==========================================
import { shopState, saveProgress } from './gameplay.js?v=19';

class PublisherSDK {
    constructor() {
        this.platform = 'simulation'; // 'simulation', 'crazygames', 'poki', 'telegram'
        this.isAdblockEnabled = false;
        this.sdkInstance = null;
    }

    init(onComplete) {
        // 1. Detect environment
        if (window.CrazyGames) {
            this.platform = 'crazygames';
            this.sdkInstance = window.CrazyGames.SDK;
            console.log('PublisherSDK: CrazyGames environment detected.');
        } else if (window.pokiSDK) {
            this.platform = 'poki';
            this.sdkInstance = window.pokiSDK;
            console.log('PublisherSDK: Poki environment detected.');
        } else if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
            this.platform = 'telegram';
            this.sdkInstance = window.Telegram.WebApp;
            console.log('PublisherSDK: Telegram WebApp environment detected.');
        } else {
            this.platform = 'simulation';
            console.log('PublisherSDK: Simulation mode active.');
        }

        // 2. Initialize platform SDKs
        if (this.platform === 'crazygames') {
            this.sdkInstance.init().then(() => {
                console.log('PublisherSDK: CrazyGames SDK initialized.');
                if (onComplete) onComplete();
            }).catch(err => {
                console.error('PublisherSDK: CrazyGames init failed', err);
                if (onComplete) onComplete();
            });
        } else if (this.platform === 'poki') {
            this.sdkInstance.init().then(() => {
                console.log('PublisherSDK: Poki SDK initialized.');
                if (onComplete) onComplete();
            }).catch(err => {
                console.warn('PublisherSDK: Poki init failed, adblocker might be active', err);
                this.isAdblockEnabled = true;
                if (onComplete) onComplete();
            });
        } else if (this.platform === 'telegram') {
            this.sdkInstance.ready();
            this.sdkInstance.expand();
            console.log('PublisherSDK: Telegram WebApp expanded.');
            if (onComplete) onComplete();
        } else {
            if (onComplete) onComplete();
        }
    }

    // Call this when starting a level
    gameplayStart() {
        if (this.platform === 'poki' && !this.isAdblockEnabled) {
            this.sdkInstance.gameplayStart();
        }
        console.log('PublisherSDK: gameplayStart triggered.');
    }

    // Call this when level completes or player exits to menu
    gameplayStop() {
        if (this.platform === 'poki' && !this.isAdblockEnabled) {
            this.sdkInstance.gameplayStop();
        }
        console.log('PublisherSDK: gameplayStop triggered.');
    }

    // Interstitial ad (midroll) between levels
    showInterstitialAd(onComplete) {
        console.log('PublisherSDK: Requesting Interstitial Ad...');
        if (this.platform === 'crazygames') {
            this.sdkInstance.ad.requestAd('midroll', {
                adStarted: () => console.log('CrazyGames midroll started'),
                adFinished: () => { if (onComplete) onComplete(); },
                adError: () => { if (onComplete) onComplete(); }
            });
        } else if (this.platform === 'poki' && !this.isAdblockEnabled) {
            this.sdkInstance.commercialBreak().then(() => {
                if (onComplete) onComplete();
            });
        } else {
            // Simulation fallback
            if (window.showSimulatedAd) {
                window.showSimulatedAd(onComplete);
            } else if (onComplete) {
                onComplete();
            }
        }
    }

    // Reward Ad for free gems or double coins
    showRewardAd(onSuccess, onFailure) {
        console.log('PublisherSDK: Requesting Rewarded Ad...');
        if (this.platform === 'crazygames') {
            this.sdkInstance.ad.requestAd('rewarded', {
                adStarted: () => console.log('CrazyGames reward ad started'),
                adFinished: () => { if (onSuccess) onSuccess(); },
                adError: () => { if (onFailure) onFailure(); }
            });
        } else if (this.platform === 'poki' && !this.isAdblockEnabled) {
            this.sdkInstance.rewardedBreak().then(success => {
                if (success) {
                    if (onSuccess) onSuccess();
                } else {
                    if (onFailure) onFailure();
                }
            });
        } else {
            // Simulation fallback
            if (window.showSimulatedAd) {
                window.showSimulatedAd(onSuccess);
            } else {
                // Instantly reward if simulation overlay is missing
                if (onSuccess) onSuccess();
            }
        }
    }

    // Purchase VIP Club (Real integration or simulation)
    purchaseVIP(onSuccess) {
        if (this.platform === 'telegram') {
            console.log('PublisherSDK: Initiating Telegram Star purchase for VIP Club...');
            this.sdkInstance.openInvoice('vip_club_invoice_url', (status) => {
                if (status === 'paid') {
                    shopState.vipActive = true;
                    saveProgress();
                    if (onSuccess) onSuccess();
                }
            });
        } else {
            // Default Simulation Mode
            if (window.openIAP) {
                window.openIAP({
                    type: 'vip-money',
                    name: '👑 Clube VIP Permanente',
                    price: 'R$ 19,90',
                    gems: 30, // vip cost in gems if gems buy, but we pay money
                    vip: true
                }, onSuccess);
            }
        }
    }

    // Purchase Gem Packs (Real integration or simulation)
    purchaseGems(packId, priceStr, amount, onSuccess) {
        if (this.platform === 'telegram') {
            console.log(`PublisherSDK: Initiating Telegram Star purchase for pack ${packId}...`);
            this.sdkInstance.openInvoice(`pack_${packId}_invoice_url`, (status) => {
                if (status === 'paid') {
                    shopState.gems += amount;
                    saveProgress();
                    if (onSuccess) onSuccess();
                }
            });
        } else {
            // Default Simulation Mode
            if (window.openIAP) {
                window.openIAP({
                    type: 'gems',
                    name: `💎 ${amount} Gemas Estelares`,
                    price: priceStr,
                    gems: amount,
                    vip: false
                }, onSuccess);
            }
        }
    }
}

export const publisherSDK = new PublisherSDK();

