# SIR_Disease_Simulation

The SIR model is one of the compartmental models in epidemiology, and many models are derivatives of this basic form.
SIR stands for Susceptible, Infected, Recovered. <br>
The model consists of three compartments:- <br>
          1> S:  The number of susceptible individuals. When a susceptible and an infectious individual come into "infectious contact", the susceptible individual contracts the disease and transitions to the infectious compartment. <br>
          2> I:  The number of infectious individuals. These are individuals who have been infected and are capable of infecting susceptible individuals. <br>
          3> R:  This compartment may also be called "recovered" or "resistant". It consists of individuals who have developed immune via once becoming infected and then recovered. Now they can not be infected again. <br> <br>
          
The project was done under Prof. MVP, CSE, IIT, Hyderabad.
 <br>
The project shows the use of file management, event management along with the algorithmic approach to SIR Simulation using statistical analysis, probabilistic approach, and priority assignment.
It is written in C language and used custom Data-structure to increase efficiency both time-wise and memory-wise.
The Project uses Graph, binary heap's array-based implementation for event management.
 <br>
Parameters: 1> Probability of infection <br>
	         2> Probability of Recovery <br>
                     3> Simulation TIme <br>
	         4> The community (represented by the undirected graph). <br> <br>
In the Graph, the node represents a person and the edge represents the connection between two persons (if they can come in contact with each other).
 <br>
After the initialization of the graph, we randomly choose a certain amount of nodes and make them infected and then run the simulation.
The output.txt file prints the adjacency matrix of the graph and after that it prints the node id of suspected, infected, and recovered at the end of each day.
 <br>
We then input it into a graphical representation module created using MATPLOTLIB in Python to show the data visually.


