from rest_framework.renderers import BrowsableAPIRenderer

class CustomBrowsableAPIRenderer(BrowsableAPIRenderer):
    def get_context(self, *args, **kwargs):
        context = super().get_context(*args, **kwargs)
        context['display_edit_forms'] = True
        context['show_auth_header'] = True
        return context

    def get_rendered_html_form(self, data, view, method, request):
        if method == 'GET':
            return """
            <div class="auth-header-form">
                <label for="auth-header">Authorization Header:</label>
                <input type="text" id="auth-header" name="Authorization" placeholder="Bearer your_token_here" style="width: 100%;">
            </div>
            """ + super().get_rendered_html_form(data, view, method, request)
        return super().get_rendered_html_form(data, view, method, request) 