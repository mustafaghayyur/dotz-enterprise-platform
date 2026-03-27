"""
    Helper functions to handle data operations.
"""

def getter(subject, key, defaultValue = None):
    """
        Safely fetch key from dictionary or object, without
        throwing errors. Can set a default for failed fetches.

        :param subject: [obj|dict]
        :param key: [str]
        :param defaultValue: [*]
    """
    if isinstance(subject, dict):
        return subject.get(key, defaultValue)
    if isinstance(subject, object):
        return getattr(subject, key, defaultValue)
    return defaultValue


def mergeDictionaries(leftDictionary, rightDictionary):
        """
            Simply merges left dictionary with right dictionary.
            The right dictionary over-writes the left.

            :param leftDictionary: [dict]
            :param rightDictionary: [dict]
        """
        if isinstance(leftDictionary, dict) and isinstance(rightDictionary, dict):
            meerged = leftDictionary | rightDictionary  # merge provided conditions into the defaults        

            if isinstance(meerged, dict):
                return meerged
            
        return {}