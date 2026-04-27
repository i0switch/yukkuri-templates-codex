import {loadEpisodeRenderData} from '../lib/load-script';
import ep962RmCreditcardSilentChargeTrap from '../../script/ep962-rm-creditcard-silent-charge-trap/script.render.json';
import ep963ZmSmartphoneNotificationBatterySave from '../../script/ep963-zm-smartphone-notification-battery-save/script.render.json';

export const episodeCompositions = [
  loadEpisodeRenderData(ep962RmCreditcardSilentChargeTrap),
  loadEpisodeRenderData(ep963ZmSmartphoneNotificationBatterySave),
];
