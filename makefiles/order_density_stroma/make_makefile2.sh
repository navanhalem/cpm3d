settings=$settingsfolder/$expname-settings.js
template=$settingsfolder/$expname-template.js #txt

paramfile=params2.txt
nsim=10
EXPNAME=order3d

# ---------------------------------------------------------------------
# CODE:
# ---------------------------------------------------------------------

np=$( cat $paramfile | wc -l )

echo ".DELETE_ON_ERROR :"
echo "all : "
# Loop over the simulations and parameter combis

for p in $(seq 1 $np) ; do

	LFORCED=$( cat $paramfile | awk -v line=$p 'NR==line{print $1}')
	DENSITY=$( cat $paramfile | awk -v line=$p 'NR==line{print $2}')
		
	NAME=$EXPNAME-lforced$LFORCED-lrand0-density$DENSITY

	# Now the recipes for the individual simulation tracks
	for sim in $(seq 1 $nsim) ; do

		# Ensure the loop can be easily stopped
		trap "exit 1" SIGINT SIGTERM

		# trackfiles
		FILE=../../data/order_density_stroma/$EXPNAME/$NAME-sim$sim.txt
		echo "$FILE : ../../cpm3d.js"
		echo -e "\t@"node \$\< $LFORCED 0 200 $DENSITY 50 5000 1 0 0 "> \$@"
		echo "all : "$FILE
	done
done
