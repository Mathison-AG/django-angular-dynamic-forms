from functools import wraps

from rest_framework.decorators import detail_route
from rest_framework.relations import PrimaryKeyRelatedField
from rest_framework.decorators import action

def linked_form(viewset, form_id=None, link=None, link_id=None, method=None):
    """
    When having foreign key or m2m relationships between models A and B (B has foreign key to A named parent),
    we want to have a form that sits on A's viewset but creates/edits B and sets it relationship to A
    automatically.

    In order to do so, define linked_forms on A's viewset containing a call to linked_form as follows:

    @linked_forms()
    class AViewSet(AngularFormMixin, ...):
        linked_forms = {
            'new-b': linked_form(BViewSet, link='parent')
        }

    Then, there will be a form definition on <aviewset>/pk/forms/new-b, with POST/PATCH operations pointing
    to an automatically created endpoint <aviewset>/pk/linked-endpoint/new-b and detail-route named "new_b"

    :param viewset:     the foreign viewset
    :param form_id:     id of the form on the foreign viewset. If unset, use the default form
    :param link:        either a field name on the foreign viewset or a callable that will get (foreign_instance, this_instance)
    :return:            an internal definition of a linked form
    """
    return {
        'viewset' : viewset,
        'form_id' : form_id,
        'link'    : link,
        'link_id' : link_id,
        'method'  : method
    }


def linked_forms():
    def build_form(clz, form_name, form_def):
        def form_method(self, request, pk, *args, **kwargs):
            viewset = form_def['viewset']()
            viewset.request = request
            viewset.format_kwarg = self.format_kwarg
            link = form_def['link']
            if isinstance(link, str):
                serializer = viewset.get_serializer()
                fld = serializer.fields[link]
                if isinstance(fld, PrimaryKeyRelatedField):
                    request.data[link] = self.get_object().pk
                else:
                    request.data[link] = self.get_serializer(instance=self.get_object()).data

            method = form_def['method']
            if 'link_id' in form_def:
                link_id = request.GET.get(form_def['link_id']) or request.data.get(form_def['link_id'])
                viewset.lookup_url_kwarg = form_def['link_id']
                viewset.kwargs = {
                    viewset.lookup_url_kwarg: link_id
                }
            else:
                link_id = None

            if request._request.method == 'GET':
                method = 'retrieve'
            elif not method:
                method = 'create' if not link_id else 'update'

            return getattr(viewset, method)(request, *args, **kwargs)

        form_method.__name__ = form_name.replace('-', '_')

        return (
            form_name.replace('-', '_'),
            action(methods=['get', 'post', 'patch'], detail=True, url_path=form_name)(form_method))

    def wrapper(clz):
        forms = getattr(clz, 'linked_forms', {})
        if forms:
            new_methods = []
            for form_name, form_def in forms.items():
                new_methods.append(build_form(clz, form_name, form_def))
            clz = type('%s_linked' % clz.__name__, (clz, ), dict(new_methods))

        return clz
    return wrapper
