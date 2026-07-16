## Pluggable markdown rendering component

This component is built using concepts from [ngx-remark](https://github.com/ericleib/ngx-remark),
namely using Angular templates to render the AST produced by `remark`.

Unlike `ngx-remark`, it features a configuration based approach of extensibility so that multiple
instances of the component can be used with the same configuration, e.g. inside a chat component
w/o repeating templates.
