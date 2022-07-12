touch .git/hooks/pre-commit
echo "#!/bin/sh

npm run format
npm run lint
" > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

touch .git/hooks/pre-push
echo "#!/bin/sh

npm run format
npm run lint
npm run test:unit
npm run build
" > .git/hooks/pre-push
chmod +x .git/hooks/pre-push 