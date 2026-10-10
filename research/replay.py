"""Offline replay of an extracted Agent Deck study; no model calls or result writes."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
import argparse,json,hashlib
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('study_root',type=Path,help='Extracted structured-study directory, preserving its sibling v2-study')
args=parser.parse_args();root=args.study_root.resolve()
assert root.is_dir() and (root/'protocol/freeze.json').is_file(),'Expected extracted structured-study directory'
freeze=json.loads((root/'protocol/freeze.json').read_text(encoding='utf8'))
for name,wanted in freeze['inputs_sha256'].items():
 assert hashlib.sha256((root/name).read_bytes()).hexdigest()==wanted,name
sys.path.insert(0,str(root/'analysis'))
import analyze_with_incidents as analysis
batch=analysis.merge_batches()
# Force portable attestations; do not depend on original host control paths.
for chunk in batch['chunks']:
 chunk['control_dir']=str(root/'tmp/unavailable-original-controls'/Path(chunk['control_dir']).name)
audit=analysis.audit(batch,freeze)
statistics=analysis.missingness_analysis(batch,freeze,analysis.summarize(batch,freeze))
assert statistics==json.loads((root/'output/statistics.json').read_text(encoding='utf8')),'Statistics differ from the sealed snapshot'
print(json.dumps({'frozen_inputs_verified':len(freeze['inputs_sha256']),'audit':audit,'statistics_exact_match':True,'model_calls':0,'scope':'Offline internal consistency check, not independent inference replication'},indent=2))
