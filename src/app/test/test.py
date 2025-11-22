Messages = []
Nodes = []

class Node:
    def __init__(self, id, title):
        self.id = id
        self.title = title
        self.NodeMessages = []
        self.Children = []

class Message:
    def __init__(self, id, content, role):
        self.id = id
        self.content = content
        self.role = role 

def createNode(message):
    if message == "0":
        return ('no', None)
    else:
        return ('yes', 'new node')


def chat(MessageID=0, currNode=None):
    if currNode is None:
        currNode = Nodes[-1]
    MessageID += 1

    wantnode = input("which node to go to (enter node id): ")

    if wantnode.lower() != -1:
        for node in Nodes:
            if str(node.id) == wantnode:
                currNode = node
                break

    role = input("Enter your role : ")
    message = input("Enter your message: ")

    if message.lower() == "exit":
        return
    

    create, title = createNode(message)

    newMessage = Message(id=MessageID, content=message, role=role)
    Messages.append(newMessage)

    if create == 'no':
        currNode.NodeMessages.append(newMessage)
        chat(MessageID)
    else:
        newNode = Node(id=len(Nodes), title=title)
        if len(Nodes) > 0:
            currNode.Children.append(newNode)
        Nodes.append(newNode)
        newNode.NodeMessages.append(newMessage)
        chat(MessageID)
def treeVisualization():
    for node in Nodes:
        print(f"Node ID: {node.id}, Title: {node.title}")
        for msg in node.NodeMessages:
            print(f"  Message ID: {msg.id}, Role: {msg.role}, Content: {msg.content}")
        print("  Children IDs:", [child.id for child in node.Children])
def startChat():
    initialNode = Node(id=0, title="Root Node")
    Nodes.append(initialNode)
    chat()
        
startChat()
treeVisualization()

