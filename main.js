export default {
    /**
     * @method install
     * @param {*} Vue 
     * @param {*} options  flow style: { userAuthFactory: void => string[], router: VueRouterObject, routeGuard: (to, from, next) => void }
     */
    install(Vue, options={ userAuthFactory: () => [], router: undefined, routeGuard: () => null }) {
        /**
         * @function checkAccess
         * @description
         * @param achieved      {string[]}      User's authorities.
         * @param required      {string[]}      Authorities required to access to this component. User with all of them can be considered as permitted.
         * @param anyRequired   {string[]}      User with any authority in this array would be considered as permitted.
         * @returns             {boolean}       Accessible or not.
         */
        const checkAccess = ({ achieved, required, anyRequired }) => {
            if (required && anyRequired && required.length > 0 &&
                anyRequired.length > 0) {
                // All >= 1 element
                return required.every(e => achieved.includes(e)) &&
                    anyRequired.some(e => achieved.includes(e));
            } else if (required && required.length > 0) {
                // required[] >= 1 element. anyRequired[] not specified.
                return required.every(e => achieved.includes(e));
            } else if (anyRequired && anyRequired.length > 0) {
                // anyRequired[] >= 1 element. required[] not specified.
                return anyRequired.some(e => achieved.includes(e));
            } else {
                return true;
            }
        };

        const updateElement = (el, binding) => {
            let userAuth = options.userAuthFactory() || [];
            let requiredAuth = Object.keys(binding.modifiers);
            let anyRequiredAuth = binding.arg ? binding.arg.split('|') : [];
            // If all empty? Value mode
            if (requiredAuth.length <= 0 && anyRequiredAuth.length <= 0 && binding.value) {
                requiredAuth = binding.value.access || [];
                anyRequiredAuth = binding.value.anyAccess || [];
            }
            // Validate your access auth
            if (!checkAccess({ achieved: userAuth, required: requiredAuth, anyRequired: anyRequiredAuth })) {
                el.innerHTML = '';
                el.setAttribute('style', 'display: none');
            }

        };

        // Register directive
        Vue.directive('access', {
            bind: updateElement,
            update: updateElement
        });

        const { router, routeGuard } = options;
        if (router === undefined) return;
        // Register route guard
        router.beforeEach(async (to, from, next) => {
            /******************** Access control *******************/
            const allRequiredAuth = to.meta.access || [];
            const anyRequiredAuth = to.meta.anyAccess || [];
            let userAuth = userAuthFactory();
            const makeDecision = (myAuth) => {
                if (checkAccess({
                        achieved:    myAuth,
                        required:    allRequiredAuth,
                        anyRequired: anyRequiredAuth
                    })) {
                    next();
                } else {
                    next('/no-permission');
                }
            };
            makeDecision(userAuth);

            routeGuard();
        });
    }
};