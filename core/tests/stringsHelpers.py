import unittest

from core.helpers.strings import decipherComparativeOperator


class StringsHelpers(unittest.TestCase):
    def oneNonString(self):
        self.assertEqual(decipherComparativeOperator(42), [None, 42, None, None])

    def twoPlainString(self):
        self.assertEqual(decipherComparativeOperator('hello'), [None, 'hello', None, None])

    def threeWithOperator(self):
        self.assertEqual(decipherComparativeOperator('[>=] 10'), ['>=', '10', None, None])

    def fourWithRangeSeparator(self):
        self.assertEqual(decipherComparativeOperator('[BETWEEN]10|20'), ['BETWEEN', '10', '20', None])

    def fiveWithBoolOperator(self):
        self.assertEqual(decipherComparativeOperator('{OR}[<>]foo'), ['<>', 'foo', None, 'OR'])

    def sixBoolOnly(self):
        self.assertEqual(decipherComparativeOperator('{AND}bar'), [None, 'bar', None, 'AND'])
