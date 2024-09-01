export class Optional {
    value;
    constructor(value) {
        this.value = value;
    }
    static empty() {
        return new Optional(null);
    }
    static of(value) {
        if (isEmpty(value)) {
            throw new Error('value is not defined');
        }
        return new Optional(value);
    }
    static ofNullable(value) {
        return new Optional(value);
    }
    get() {
        if (this.value === null || this.value === undefined) {
            throw new Error('Optional is empty');
        }
        return this.value;
    }
    isPresent() {
        return !this.isEmpty();
    }
    isEmpty() {
        return isEmpty(this.value);
    }
    ifPresent(consumer) {
        if (!isEmpty(this.value)) {
            consumer(this.value);
        }
    }
    ifPresentOrElse(presentAction, emptyAction) {
        if (!isEmpty(this.value)) {
            presentAction(this.value);
        }
        else {
            emptyAction();
        }
    }
    filter(predicate) {
        return isEmpty(this.value) || !predicate(this.value) ? Optional.empty() : this;
    }
    map(mapper) {
        return isEmpty(this.value) ? Optional.empty() : Optional.ofNullable(mapper(this.value));
    }
    flatMap(mapper) {
        return isEmpty(this.value) ? Optional.empty() : mapper(this.value);
    }
    orElse(other) {
        return isEmpty(this.value) ? other : this.value;
    }
    orElseGet(supplier) {
        return isEmpty(this.value) ? supplier() : this.value;
    }
    orElseThrow(exceptionSupplier) {
        if (isEmpty(this.value)) {
            throw exceptionSupplier();
        }
        return this.value;
    }
    or(optionalSupplier) {
        return this.isEmpty() ? optionalSupplier() : this;
    }
    orThrow(exceptionSupplier) {
        if (isEmpty(this.value)) {
            throw exceptionSupplier();
        }
        return this;
    }
    guard(predicate, exceptionSupplier) {
        return isEmpty(this.value) ? this : this.filter(predicate)
            .orThrow(exceptionSupplier);
    }
    wrapInArray() {
        if (isEmpty(this.value)) {
            return [];
        }
        else {
            return [this.value];
        }
    }
}
function isEmpty(value) {
    return value === undefined || value === null;
}
//# sourceMappingURL=index.js.map