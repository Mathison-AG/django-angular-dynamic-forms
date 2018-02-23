class LoggerDecorator:
    """
    Just for debugging the library, not intended for other uses
    """
    level = 0

    @classmethod
    def log(clz):
        def _decorator(fn):
            def _decorated(*arg,**kwargs):
                clz.level += 1
                try:
                    print("%s > '%s'(%r,%r)" % (' ' * clz.level, fn.__name__, arg, kwargs))
                    ret=fn(*arg,**kwargs)
                    print("%s < %r" % (' ' * clz.level, ret))
                    return ret
                finally:
                    clz.level -= 1
            return _decorated
        return _decorator
