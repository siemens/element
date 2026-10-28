from pathlib import Path

from jinja2 import Environment, FileSystemLoader, StrictUndefined


_examples_template = Environment(
  loader=FileSystemLoader(Path(__file__).parent / 'templates'),
  variable_start_string='[[',
  variable_end_string=']]',
  autoescape=True,
  undefined=StrictUndefined,
).get_template('examples.html.jinja')


def define_env(env):
  @env.macro
  def example(*args, **kwargs):
    macros = _examples_template.make_module({
      'examples_base': env.variables['examples_base'],
      'page': env.page,
    })
    return macros.example(*args, **kwargs)
