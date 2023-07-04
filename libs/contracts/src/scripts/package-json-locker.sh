# Calculate the SHA checksum
sha=$(shasum package.json pnpm-lock.yaml | shasum | sed 's/ .*//')

if [ $sha == "96fa16ad9da07e730b8610505fbe4caa7e512e70" ]
then
	exit 0
fi
echo "Please don't change package.json or pnpm-lock.yaml"
exit 1
