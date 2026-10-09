
// Original geometric agent. The visor and signal notch are negative space.
export const AGENT_PATH='M10 3h12v4h5v5h3v12h-4v5H6v-5H2V12h3V7h5Z M8 13h5v5H8Z M19 13h5v5h-5Z M15 3h2v6h-2Z';
export const actorColors=['#3f7667','#496e9a','#80608f','#707439','#a56335'];
export const roleColors={coordinator:'#97712b',critic:'#b04e3c',assistant:'#496e9a',researcher:'#3f7667',builder:'#496e9a',lead:'#80608f'};
export function agentSVG(color='#496e9a',className='agent-glyph'){
 return '<svg class="'+className+'" viewBox="0 0 32 32" aria-hidden="true" style="color:'+color+'"><path d="'+AGENT_PATH+'" fill="currentColor" fill-rule="evenodd"/></svg>';
}
