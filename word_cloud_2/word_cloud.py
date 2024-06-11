"""TO-DO: Write a description of what this XBlock is."""

import pkg_resources
from django.utils import translation
from opaque_keys.edx.keys import UsageKey
from web_fragments.fragment import Fragment
from xblock.core import XBlock
from xblock.fields import Boolean, Dict, Integer, List, Scope, String

try:
    from xblock.utils.resources import ResourceLoader
except ModuleNotFoundError:  # For backward compatibility with releases older than Quince.
    from xblockutils.resources import ResourceLoader

resource_loader = ResourceLoader(__name__)

# Make '_' a no-op so we can scrape strings. Using lambda instead of
#  `django.utils.translation.ugettext_noop` because Django cannot be imported in this file
_ = lambda text: text


# @XBlock.needs('i18n')
class WordCloudXBlock(XBlock):
    """
    TO-DO: document what your XBlock does.
    """

    # Fields are defined on the class.  You can access them in your code as
    # self.<fieldname>.

    # TO-DO: delete count, and define your own fields.
    # TODO: remove following line
    count = Integer(
        default=0, scope=Scope.user_state,
        help="A simple counter, to show something happening",
    )

    display_name = String(
        display_name=_("Display Name"),
        help=_("The display name for this component."),
        scope=Scope.settings,
        default="Word cloud"
    )
    instructions = String(
        display_name=_("Instructions"),
        help=_(
            "Add instructions to help learners understand how to use the word cloud. Clear instructions are important, especially for learners who have accessibility requirements."),
        # nopep8 pylint: disable=C0301
        scope=Scope.settings,
    )
    num_inputs = Integer(
        display_name=_("Inputs"),
        help=_("The number of text boxes available for learners to add words and sentences."),
        scope=Scope.settings,
        default=5,
        values={"min": 1}
    )
    num_top_words = Integer(
        display_name=_("Maximum Words"),
        help=_("The maximum number of words displayed in the generated word cloud."),
        scope=Scope.settings,
        default=250,
        values={"min": 1}
    )
    display_student_percents = Boolean(
        display_name=_("Show Percents"),
        help=_("Statistics are shown for entered words near that word."),
        scope=Scope.settings,
        default=True
    )

    # Fields for descriptor.
    submitted = Boolean(
        help=_("Whether this learner has posted words to the cloud."),
        scope=Scope.user_state,
        default=False
    )
    student_words = List(
        help=_("Student answer."),
        scope=Scope.user_state,
        default=[]
    )
    all_words = Dict(
        help=_("All possible words from all learners."),
        scope=Scope.user_state_summary
    )
    top_words = Dict(
        help=_("Top num_top_words words for word cloud."),
        scope=Scope.user_state_summary
    )

    def resource_string(self, path):
        """Handy helper for getting resources from our kit."""
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    def student_view(self, context=None):
        """
        Create primary view of the WordCloudXBlock, shown to students when viewing courses.
        """
        frag = Fragment()
        frag.add_content(resource_loader.render_django_template(
            'templates/word_cloud.html',
            {
                # 'ajax_url': self.ajax_url,
                'ajax_url': '',
                'display_name': self.display_name,
                'instructions': self.instructions,
                'element_class': "word_cloud_2",
                'element_id': self.scope_ids.usage_id,
                # TODO: review following 2 lines coming from XModuleMixin
                # 'element_class': self.location.block_type,"'word_cloud_2'"
                # 'element_id': self.location.html_id(), self.scope_ids.usage_id
                'num_inputs': self.num_inputs,
                'range_num_inputs': range(self.num_inputs),
                'submitted': self.submitted,
            },
            # i18n_service = self.runtime.service(self, 'i18n')
        ))
        frag.add_css(self.resource_string("static/css/word_cloud.css"))

        # # Add i18n js
        # statici18n_js_url = self._get_statici18n_js_url()
        # if statici18n_js_url:
        #     frag.add_javascript_url(self.runtime.local_resource_url(self, statici18n_js_url))

        frag.add_javascript(self.resource_string("static/js/src/WordCloudBlockDisplay.js"))
        frag.initialize_js('XBlockToXModuleShim')
        return frag

    # TO-DO: change this handler to perform your own actions.  You may need more
    # than one handler, or you may not need any handlers at all.
    @XBlock.json_handler
    def increment_count(self, data, suffix=''):
        """
        Increments data. An example handler.
        """
        if suffix:
            pass  # TO-DO: Use the suffix when storing data.
        # Just to show data coming in...
        assert data['hello'] == 'world'

        self.count += 1
        return {"count": self.count}

    # TO-DO: change this to create the scenarios you'd like to see in the
    # workbench while developing your XBlock.
    @staticmethod
    def workbench_scenarios():
        """Create canned scenario for display in the workbench."""
        return [
            ("WordCloudXBlock",
             """<word_cloud_2/>
             """),
            ("Multiple WordCloudXBlock",
             """<vertical_demo>
                <word_cloud_2/>
                <word_cloud_2/>
                <word_cloud_2/>
                </vertical_demo>
             """),
        ]

    @staticmethod
    def _get_statici18n_js_url():
        """
        Return the Javascript translation file for the currently selected language, if any.

        Defaults to English if available.
        """
        locale_code = translation.get_language()
        if locale_code is None:
            return None
        text_js = 'public/js/translations/{locale_code}/text.js'
        lang_code = locale_code.split('-')[0]
        for code in (locale_code, lang_code, 'en'):
            loader = ResourceLoader(__name__)
            if pkg_resources.resource_exists(
                loader.module_name, text_js.format(locale_code=code)):
                return text_js.format(locale_code=code)
        return None

    @staticmethod
    def get_dummy():
        """
        Generate initial i18n with dummy method.
        """
        return translation.gettext_noop('Dummy')
