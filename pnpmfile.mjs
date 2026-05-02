export default {
  hooks: {
    readPackage(pkg, context) {
      if (pkg.name === '@simpl/brand') {
        context.log(`@simpl/brand@${pkg.version} is being resolved`);
      }
      return pkg;
    }
  }
};
