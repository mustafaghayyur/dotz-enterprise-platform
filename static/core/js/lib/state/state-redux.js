import $A from "../../helper.js";

/**
 * Manages Redux available solely to components.
 */
export default {
    /**
     * Central repository of redux
     */
    memory: {},

    setup: function(app, componentRoot) {
        if ($A.base.get(this.memory, app, null) === null) {
            this.memory[app] = {};
        }
        if ($A.base.get(this.memory[app], componentRoot, null) === null) {
            this.memory[app][componentRoot] = {};
        }
    },

    record: function (componentRoot) {
        let app = $A.meta.get(componentRoot, 'app');
        this.setup(app, componentRoot);
        console.log('+ inspecting redux', app, componentRoot, $A.base.parse($A.base.stringify(this.memory[app])), $A.base.parse($A.base.stringify(this.memory)));
        return this.memory[app][componentRoot];
    },

    /** set meta key value. mapper values set separately */
    set: function (componentRoot, key, value, overwrite = true) {
        let app = $A.meta.get(componentRoot, 'app');
        this.setup(app, componentRoot);
        let original = $A.base.get(this.memory[app], key, null);
        let parsedValue = $A.base.parse(value);

        if (overwrite === false) {
            if (!$A.base.empty(original)) { return null; }
        }
        if (overwrite === 'merge') {
            let merged = $A.base.merge(original, parsedValue, false);
            merged = $A.base.empty(merged) ? parsedValue : merged;
            if ($A.base.is(merged, 'list')) {
                merged = [...new Set(merged)]; // remove duplicates
            }
            this.memory[app][componentRoot][key] = (merged === null) ? $A.base.parse(value) : merged;
            return null;
        }
        this.memory[app][componentRoot][key] = parsedValue;
        return null;
    },

    get: function (componentRoot, key, defaultValue = null) {
        let app = $A.meta.get(componentRoot, 'app');
        this.setup(app, componentRoot);
        console.log('++ inspecting redux', app, componentRoot, $A.base.parse($A.base.stringify(this.memory[app])), $A.base.parse($A.base.stringify(this.memory)));
        return $A.base.get(this.memory[app][componentRoot], key, defaultValue);
    },

    delete: function (componentRoot, key) {
        let app = $A.meta.get(componentRoot, 'app');
        this.setup(app, componentRoot);
        if ($A.base.get(this.memory[app][componentRoot], key, false)) {
            delete this.memory[app][componentRoot][key];
        }
    },
}