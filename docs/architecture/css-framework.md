# CSS framework

Element is partially derived from CSS classes and utilities from
[Bootstrap](https://getbootstrap.com/). Therefore, partial compatibility with
Bootstrap exists. However, using Element in combination with Bootstrap can lead
to unexpected results.

That said, we strongly recommend to use the Bootstrap utilities to minimize custom CSS
in your application. As the fundamentals of Element are originally based on Bootstrap,
refer to various chapters like [Typography](../fundamentals/typography.md) under Element
fundamentals to learn how Bootstrap utilities are meant to be used in Element.
There are also more helpful utility classes beyond the design system fundamentals
like the highly recommended [Flex utilities](https://getbootstrap.com/docs/5.1/utilities/flex/).

The [Grid system](https://getbootstrap.com/docs/5.1/layout/grid/) and other
parts of Bootstrap can be helpful too, depending on the use case. However, always
check the Element design system documentation first to follow the best practices
for usage of components and [layouts](../fundamentals/layouts/overview.md).

Note: As an on-going effort, the relevant documentation from Bootstrap will be
added directly to the Element documentation. Over time, using external
documentation will not be necessary.

## Some history

Originally, Element was based on Bootstrap as its core CSS framework.
We were providing a full Bootstrap theme. But over time, our design
system evolved in a different direction than Bootstrap and we had to overwrite
and exchange more and more parts of Bootstrap. At some point, we were not
compatible with Bootstrap anymore and decided to remove the `bootstrap` NPM
dependency with the release of Element v46.

All Bootstrap classes and stylings that are still relevant have been copied to
the folder [bootstrap](https://github.com/siemens/element/blob/main/projects/element-theme/src/styles/bootstrap/)
and adapted to our needs. We move files out of the bootstrap folder, when changes and
rewrite are drastically and the resulting files are related to bootstrap any more.

## Upgrading from older Element versions before v46

After upgrading to Element v46 or later, your application might be broken if you
are using Bootstrap features that are not part of Element and that are not copied
into Element. If `bootstrap` is still in your `node_modules` folder after
upgrading, you might have added a direct dependency that you can probably remove.
Furthermore, if you added Bootstrap's peer dependencies like `popperjs` to
remove build warnings, you should now be able to remove those dependencies as well.
