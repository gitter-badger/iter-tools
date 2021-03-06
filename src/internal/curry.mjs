export function curry (fn, expectedArgsLength = fn.length, appliedArgs = []) {
  return (...args) => {
    if (expectedArgsLength <= args.length) {
      return fn(...appliedArgs, ...args)
    }
    return curry(fn, expectedArgsLength - args.length, [...appliedArgs, ...args])
  }
}

function unshiftUndefineds (args, by) {
  if (by) {
    const argsLength = args.length
    for (let i = argsLength - 1; i >= 0; i--) {
      args[i + by] = args[i]
      args[i] = undefined
    }
  }
}

function variadicCurryWithValidationInner (
  isIterable,
  lastArgumentName,
  applyOnIterableArgs,
  fn,
  variadic,
  minConfigArgs,
  maxConfigArgs,
  args
) {
  if (args.length > minConfigArgs) {
    let iterableArgsStart = -1
    let allArgsIterable = true
    if (variadic) {
      iterableArgsStart = args.findIndex((arg, i) => isIterable(arg) && i >= minConfigArgs)

      for (let i = iterableArgsStart; i < args.length; i++) {
        allArgsIterable = allArgsIterable && isIterable(args[i])
      }
    } else if (isIterable(args[args.length - 1])) {
      // Non-variadic functions are allowed to have more than one iterable-looking parameter
      iterableArgsStart = args.length - 1
    }

    if (args.length > maxConfigArgs && (iterableArgsStart === -1 || !allArgsIterable)) {
      const lastArgumentNameOrNames = variadic ? `...${lastArgumentName}s` : lastArgumentName
      const baseMessage = `${fn.name} takes up to ${minConfigArgs} arguments, followed by ${lastArgumentNameOrNames}. You already passed ${args.length} arguments`
      if (variadic) {
        throw new Error(`${baseMessage} and the following arguments were not all ${lastArgumentName}s`)
      } else {
        throw new Error(`${baseMessage} and the last argument was not ${lastArgumentName}`)
      }
    }

    if (iterableArgsStart >= 0) {
      // We have received all the config args we are going to get

      for (let i = iterableArgsStart; i < args.length; i++) {
        args[i] = applyOnIterableArgs(args[i])
      }

      unshiftUndefineds(args, maxConfigArgs - iterableArgsStart)

      if (variadic) {
        const iterableArgs = args.slice(iterableArgsStart)
        args.splice(iterableArgsStart)

        return fn(...args, iterableArgs)
      } else {
        return fn(...args)
      }
    } else {
      // We have not received any iterables, but we must be fully configured
    }
  }

  return variadicCurryWithValidation(
    isIterable,
    lastArgumentName,
    applyOnIterableArgs,
    fn,
    variadic,
    minConfigArgs,
    maxConfigArgs,
    args
  )
}

export function variadicCurryWithValidation (
  isIterable,
  lastArgumentName,
  applyOnIterableArgs,
  fn,
  variadic,
  minConfigArgs = fn.length - 1,
  maxConfigArgs = fn.length - 1,
  previousArgs = []
) {
  return (...args) => {
    args.unshift(...previousArgs)

    return variadicCurryWithValidationInner(
      isIterable,
      lastArgumentName,
      applyOnIterableArgs,
      fn,
      variadic,
      minConfigArgs,
      maxConfigArgs,
      args
    )
  }
}
