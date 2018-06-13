#!/usr/bin/env bash

new_version=$(
git tag | egrep '^[0-9]' \
    | awk -F. '{ printf "%010d %010d %010d\n", $1, $2, ($3+1) }' \
    | sort -rn \
    | head -n 1 \
    | tr ' ' '\n' \
    | sed 's/^0*//' | sed 's/^$/0/' \
    | tr '\n' '.'  \
    | sed 's/\.$//'
)

echo "Making to version $new_version"

(find . -name "package.json"; find . -name "package-dist.json") | grep -v "node_modules" | grep -v "dist/" | while read PJ; do
    sed -i "s/\"version\": \"[0-9.]*\",$/\"version\": \"$new_version\",/" ${PJ}
done

find . -name "setup.py" | grep -v "node_modules" | while read PJ; do
    sed -i "s/version='[0-9.]*',$/version='$new_version',/" ${PJ}
done

(
    rm -rf dist
    ng lint django-angular-dynamic-forms || exit 1
    yarn build django-angular-dynamic-forms || exit 1
    cp README.rst LICENSE dist/django-angular-dynamic-forms || exit 1
    pandoc README.rst -o dist/django-angular-dynamic-forms/readme.md || exit 1
    cd dist/django-angular-dynamic-forms || exit 1
    npm publish --registry=https://registry.npmjs.org/ || exit 1
) || exit 1

(
    rm -rf dist
    . ../venv-django-angular-dynamic-forms/bin/activate
    python setup.py sdist || exit 1
    pip install twine
    twine upload dist/*tar.gz || exit 1
) || exit 1

git commit -am "version $new_version: $@"
git push

git tag $new_version
git push origin $new_version
