"""Small prepared API artifact and HTML reader shared by docs tests."""

from copy import deepcopy
from html.parser import HTMLParser
from urllib.parse import unquote


def text(value, kind='text', target=None, href=None):
  return {'kind': kind, 'text': value, 'targetId': target, 'href': href}


def paragraph(*parts):
  return {'kind': 'paragraph', 'parts': list(parts)}


def row(node_id, name, **values):
  return {'id': node_id, 'name': name, 'type': [text('string')], 'badges': [], 'default': None,
          'documentation': [], 'signatures': [], 'sourceUrl': None, **values}


def view(**values):
  return {'documentation': [], 'declaration': [], 'groups': [], 'signatures': [], 'relatedTypeIds': [], **values}


def group(kind, *rows):
  return {'kind': kind, 'title': kind.capitalize(), 'showDefaults': kind == 'inputs', 'rows': list(rows)}


def symbol(node_id, name, **values):
  return {'id': node_id, 'name': name, 'packageName': '@test/library', 'importPath': '@test/library',
          'importStatement': f"import {{ {name} }} from '@test/library';", 'kind': 'interface',
          'referencePath': f'api/test/{name}.md', 'sourceUrl': None, 'metadata': [],
          'api': view(), 'type': view(), **values}


def fixture(*extra_symbols):
  config_link = lambda: text('Config', 'link', target='config')  # noqa: E731

  run = row('widget.run', 'run', signatures=[{
    'id': f'widget.run.{number}', 'label': [text(f'run(value: {kind}): Config')],
    'documentation': [paragraph(text(f'Overload {number}.'))],
    'parameters': [row(f'widget.run.{number}.value', 'value')], 'returns': [config_link()],
  } for number, kind in ((1, 'string'), (2, 'Config'))])
  api = view(documentation=[paragraph(text('Uses '), config_link())], relatedTypeIds=['config'], groups=[
    group('inputs', row('widget.value', 'publicValue', type=[config_link()], badges=['required'], default="'<literal>'")),
    group('methods', run),
  ])
  symbols = [symbol('widget', 'Widget', kind='component', api=api, type=deepcopy(api)),
             symbol('config', 'Config', kind='type_alias', importStatement=None,
                    type=view(declaration=[text('type Config = Record<string, "<literal>">')])), *extra_symbols]
  index, targets = {}, {}
  for item in symbols:
    for key in (item['name'], f"{item['packageName']}#{item['name']}"):
      index.setdefault(key, []).append(item['id'])
    targets[item['id']] = {'symbolId': item['id'], 'anchor': item['name']}
  for node, anchor in (
    ('widget.value', 'Widget.publicValue'), ('widget.run', 'Widget.run'),
    ('widget.run.1', 'Widget.run.signature-1'), ('widget.run.1.value', 'Widget.run.signature-1.value'),
    ('widget.run.2', 'Widget.run.signature-2'), ('widget.run.2.value', 'Widget.run.signature-2.value'),
  ):
    targets[node] = {'symbolId': 'widget', 'anchor': anchor}
  return {'schemaVersion': 2, 'symbols': symbols, 'index': index, 'targets': targets,
          'members': {'run-selection': {'symbolId': 'widget', 'view': view(
            groups=[group('methods', deepcopy(run))], relatedTypeIds=['config'])}},
          'memberIndex': {'Widget.run': ['run-selection']}}


class Html(HTMLParser):
  def __init__(self, source):
    super().__init__()
    self.elements = []
    self.feed(source)

  def handle_starttag(self, tag, attrs):
    self.elements.append((tag, dict(attrs)))

  @property
  def ids(self):
    return [attrs['id'] for _, attrs in self.elements if 'id' in attrs]

  @property
  def links(self):
    return [attrs['href'] for tag, attrs in self.elements if tag == 'a' and 'href' in attrs]


def check_invariants(browser, exported, leftover_tags=False):
  page = Html(browser)
  assert Html(exported).ids == page.ids and len(page.ids) == len(set(page.ids))
  assert {unquote(link[1:]) for link in page.links if link.startswith('#')} <= set(page.ids)
  assert 'data-api-alias' not in browser + exported and (leftover_tags or '<si-docs-' not in browser)
