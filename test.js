import { system } from "@minecraft/server";
import PageFormData from './pageFormData.js';

system.afterEvents.scriptEventReceive.subscribe(event => {

  const player = event?.sourceEntity
  
  if (event.id != 'pageForm:show') return;
  if (player === undefined) return;

  const form = new PageFormData(5);
  form.title('titleText');
  form.body('bodyText');

  for ( let i = 0 ; i < 12 ; i ++ ) form.button('button' + i); 

  form.show(player, (response) => {

    if (response.canceled) {

      console.warn('canceled');

    } else {

      console.warn('selection : ' + response?.selection);

    };

  });

});


// You can test it using the "/scriptevent pageForm:show"  command.
